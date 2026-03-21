import 'dart:io';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../core/di/app_providers.dart';
import '../../../core/error/app_exception.dart';
import '../../../core/router/app_router.dart';
import '../../../domain/models/models.dart';
import '../../../shared/utils/url_helper.dart';
import '../../providers/image_post_provider.dart';
import '../map/location_picker_screen.dart';

/// 이미지 게시글 작성/수정 화면.
class ImagePostFormScreen extends ConsumerStatefulWidget {
  const ImagePostFormScreen({super.key, this.postId});

  final int? postId;

  bool get isEdit => postId != null;

  @override
  ConsumerState<ImagePostFormScreen> createState() => _ImagePostFormScreenState();
}

class _ImagePostFormScreenState extends ConsumerState<ImagePostFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();
  final _latitudeController = TextEditingController();
  final _longitudeController = TextEditingController();
  final ImagePicker _imagePicker = ImagePicker();

  bool _isInitializing = true;
  bool _isSubmitting = false;
  String? _generalError;
  String? _titleError;
  String? _contentError;
  String? _latitudeError;
  String? _longitudeError;

  String? _selectedImagePath;
  String? _existingImageUrl;
  List<PinResponse> _pins = const [];
  int? _selectedPinId;

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    _latitudeController.dispose();
    _longitudeController.dispose();
    super.dispose();
  }

  Future<void> _loadInitialData() async {
    setState(() {
      _isInitializing = true;
      _generalError = null;
    });
    try {
      final minePinsFuture = pinRepository.getAll(size: 100);
      final postFuture =
          widget.isEdit ? imagePostRepository.getById(widget.postId!) : null;

      final pinPage = await minePinsFuture;
      final editingPost = postFuture != null ? await postFuture : null;

      _pins = pinPage.content;

      if (editingPost != null) {
        _titleController.text = editingPost.title;
        _contentController.text = editingPost.content;
        _latitudeController.text = editingPost.latitude?.toString() ?? '';
        _longitudeController.text = editingPost.longitude?.toString() ?? '';
        _selectedPinId = editingPost.pinId;
        _existingImageUrl = editingPost.imageUrl;
      }

      if (_selectedPinId != null &&
          !_pins.any((pin) => pin.id == _selectedPinId)) {
        _selectedPinId = null;
      }
    } on AppException catch (e) {
      _generalError = e.message;
    } catch (e) {
      _generalError = e.toString();
    } finally {
      if (!mounted) return;
      setState(() {
        _isInitializing = false;
      });
    }
  }

  void _clearErrors() {
    setState(() {
      _generalError = null;
      _titleError = null;
      _contentError = null;
      _latitudeError = null;
      _longitudeError = null;
    });
  }

  double? _parseCoordinate(String value, {required bool isLatitude}) {
    if (value.trim().isEmpty) return null;
    final parsed = double.tryParse(value.trim());
    if (parsed == null) {
      if (isLatitude) {
        _latitudeError = '숫자 형식이어야 합니다.';
      } else {
        _longitudeError = '숫자 형식이어야 합니다.';
      }
      return null;
    }
    return parsed;
  }

  Future<void> _pickImage() async {
    final picked = await _imagePicker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 85,
      maxWidth: 2048,
    );
    if (picked == null) return;
    setState(() {
      _selectedImagePath = picked.path;
    });
  }

  Future<void> _pickLocationOnMap() async {
    final initialLat = double.tryParse(_latitudeController.text.trim());
    final initialLng = double.tryParse(_longitudeController.text.trim());

    final picked = await Navigator.of(context).push<PickedLocation>(
      MaterialPageRoute(
        builder: (_) => LocationPickerScreen(
          initialLatitude: initialLat,
          initialLongitude: initialLng,
        ),
      ),
    );

    if (picked == null || !mounted) return;

    setState(() {
      _latitudeController.text = picked.latitude.toStringAsFixed(6);
      _longitudeController.text = picked.longitude.toStringAsFixed(6);
      _latitudeError = null;
      _longitudeError = null;
    });
  }

  Future<void> _submit() async {
    _clearErrors();
    if (!_formKey.currentState!.validate()) return;

    final lat = _parseCoordinate(_latitudeController.text, isLatitude: true);
    final lng = _parseCoordinate(_longitudeController.text, isLatitude: false);
    final hasLatText = _latitudeController.text.trim().isNotEmpty;
    final hasLngText = _longitudeController.text.trim().isNotEmpty;

    if ((hasLatText || hasLngText) && (lat == null || lng == null)) {
      setState(() {});
      return;
    }
    if ((lat == null) != (lng == null)) {
      setState(() {
        _generalError = '위도/경도는 함께 입력해야 합니다.';
      });
      return;
    }
    if (!widget.isEdit && _selectedImagePath == null) {
      setState(() {
        _generalError = '이미지를 선택하세요.';
      });
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final saved = widget.isEdit
          ? await imagePostRepository.update(
              widget.postId!,
              title: _titleController.text.trim(),
              content: _contentController.text.trim(),
              imagePath: _selectedImagePath,
              latitude: lat,
              longitude: lng,
              pinId: _selectedPinId,
            )
          : await imagePostRepository.create(
              title: _titleController.text.trim(),
              content: _contentController.text.trim(),
              imagePath: _selectedImagePath!,
              latitude: lat,
              longitude: lng,
              pinId: _selectedPinId,
            );

      ref.invalidate(imagePostListProvider(const ImagePostListParams()));
      if (widget.isEdit) {
        ref.invalidate(imagePostDetailProvider(widget.postId!));
      }

      if (!mounted) return;
      context.go(AppRoutes.imagePostDetailPath(saved.id));
    } on AppException catch (e) {
      _applyException(e);
    } catch (e) {
      setState(() {
        _generalError = e.toString();
      });
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  void _applyException(AppException e) {
    setState(() {
      if (e is ApiException && e.fieldErrors != null) {
        for (final field in e.fieldErrors!) {
          if (field.field == 'title') _titleError = field.reason;
          if (field.field == 'content') _contentError = field.reason;
          if (field.field == 'latitude') _latitudeError = field.reason;
          if (field.field == 'longitude') _longitudeError = field.reason;
        }
      }

      if (e is ForbiddenException ||
          (e is ApiException && e.code == 'FORBIDDEN')) {
        _generalError = '권한이 없습니다.';
        return;
      }

      if (e is UnauthorizedException ||
          (e is ApiException && e.code == 'UNAUTHORIZED')) {
        _generalError = '로그인이 필요합니다.';
        if (mounted) {
          context.go(AppRoutes.login);
        }
        return;
      }

      _generalError = e.message;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isInitializing) {
      return Scaffold(
        appBar: AppBar(title: Text(widget.isEdit ? '이미지 게시글 수정' : '이미지 게시글 작성')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(title: Text(widget.isEdit ? '이미지 게시글 수정' : '이미지 게시글 작성')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                AspectRatio(
                  aspectRatio: 16 / 9,
                  child: _selectedImagePath != null
                      ? Image.file(File(_selectedImagePath!), fit: BoxFit.cover)
                      : (_existingImageUrl != null
                          ? CachedNetworkImage(
                              imageUrl: toAbsoluteUrl(_existingImageUrl),
                              fit: BoxFit.cover,
                              placeholder: (context, url) => const Center(
                                child: CircularProgressIndicator(),
                              ),
                              errorWidget: (context, url, error) =>
                                  const Icon(Icons.broken_image),
                            )
                          : Container(
                              color: Theme.of(context).colorScheme.surfaceContainerHighest,
                              alignment: Alignment.center,
                              child: const Text('선택된 이미지가 없습니다.'),
                            )),
                ),
                const SizedBox(height: 8),
                OutlinedButton.icon(
                  onPressed: _pickImage,
                  icon: const Icon(Icons.image_outlined),
                  label: Text(widget.isEdit ? '이미지 변경' : '이미지 선택'),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _titleController,
                  decoration: InputDecoration(
                    labelText: '제목',
                    border: const OutlineInputBorder(),
                    errorText: _titleError,
                  ),
                  validator: (v) =>
                      (v == null || v.trim().isEmpty) ? '제목을 입력하세요.' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _contentController,
                  minLines: 5,
                  maxLines: 10,
                  decoration: InputDecoration(
                    labelText: '내용',
                    border: const OutlineInputBorder(),
                    errorText: _contentError,
                  ),
                  validator: (v) =>
                      (v == null || v.trim().isEmpty) ? '내용을 입력하세요.' : null,
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<int?>(
                  value: _selectedPinId,
                  decoration: const InputDecoration(
                    labelText: '연결 Pin (선택)',
                    border: OutlineInputBorder(),
                  ),
                  items: [
                    const DropdownMenuItem<int?>(
                      value: null,
                      child: Text('선택 안 함'),
                    ),
                    ..._pins.map(
                      (pin) => DropdownMenuItem<int?>(
                        value: pin.id,
                        child: Text(
                          '#${pin.id} ${pin.description ?? ''}'
                              .trim()
                              .ifEmpty('Pin #${pin.id}'),
                        ),
                      ),
                    ),
                  ],
                  onChanged: (value) {
                    setState(() {
                      _selectedPinId = value;
                    });
                    if (value == null) return;
                    final pin = _pins.firstWhere((p) => p.id == value);
                    _latitudeController.text = pin.latitude.toStringAsFixed(6);
                    _longitudeController.text = pin.longitude.toStringAsFixed(6);
                  },
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _latitudeController,
                        keyboardType: const TextInputType.numberWithOptions(
                          decimal: true,
                          signed: true,
                        ),
                        decoration: InputDecoration(
                          labelText: '위도 (선택)',
                          border: const OutlineInputBorder(),
                          errorText: _latitudeError,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextFormField(
                        controller: _longitudeController,
                        keyboardType: const TextInputType.numberWithOptions(
                          decimal: true,
                          signed: true,
                        ),
                        decoration: InputDecoration(
                          labelText: '경도 (선택)',
                          border: const OutlineInputBorder(),
                          errorText: _longitudeError,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Align(
                  alignment: Alignment.centerLeft,
                  child: OutlinedButton.icon(
                    onPressed: _pickLocationOnMap,
                    icon: const Icon(Icons.map_outlined),
                    label: const Text('지도에서 위치 선택'),
                  ),
                ),
                if (_generalError != null) ...[
                  const SizedBox(height: 8),
                  Text(
                    _generalError!,
                    style: TextStyle(color: Theme.of(context).colorScheme.error),
                  ),
                ],
                const SizedBox(height: 20),
                FilledButton(
                  onPressed: _isSubmitting ? null : _submit,
                  child: _isSubmitting
                      ? const SizedBox(
                          height: 18,
                          width: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : Text(widget.isEdit ? '수정하기' : '작성하기'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

extension _StringIfEmpty on String {
  String ifEmpty(String replacement) => trim().isEmpty ? replacement : this;
}
