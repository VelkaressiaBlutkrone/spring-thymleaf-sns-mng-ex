// 이미지 게시글 상세 화면. TASK_MOBILE Step 5, Step 8 (수정/삭제)
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/di/app_providers.dart';
import '../../../core/error/app_exception.dart';
import '../../../core/router/app_router.dart';
import '../../../shared/utils/url_helper.dart';
import '../../../shared/widgets/common/app_error_view.dart';
import '../../../shared/widgets/common/loading_widget.dart';
import '../../providers/auth_provider.dart';
import '../../providers/image_post_provider.dart';

/// 이미지 게시글 상세
class ImagePostDetailScreen extends ConsumerWidget {
  const ImagePostDetailScreen({super.key, required this.postId});

  final int postId;

  /// 현재 로그인 사용자가 작성자인지 확인
  bool _isAuthor(WidgetRef ref, int authorId) {
    final authState = ref.read(authNotifierProvider);
    return authState is AuthAuthenticated && authState.member.id == authorId;
  }

  /// 삭제 확인 다이얼로그
  Future<void> _confirmDelete(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('이미지 게시글 삭제'),
        content: const Text('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('취소'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(ctx).colorScheme.error,
            ),
            child: const Text('삭제'),
          ),
        ],
      ),
    );

    if (confirmed != true || !context.mounted) return;

    try {
      await imagePostRepository.delete(postId);
      ref.invalidate(imagePostListProvider(const ImagePostListParams()));
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('이미지 게시글이 삭제되었습니다.')),
        );
        context.go(AppRoutes.posts);
      }
    } on AppException catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.message)),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(imagePostDetailProvider(postId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('이미지 게시글 상세'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        actions: [
          if (async.valueOrNull != null &&
              _isAuthor(ref, async.valueOrNull!.authorId)) ...[
            IconButton(
              icon: const Icon(Icons.edit_outlined),
              tooltip: '수정',
              onPressed: () =>
                  context.push(AppRoutes.imagePostEditPath(postId)),
            ),
            IconButton(
              icon: const Icon(Icons.delete_outline),
              tooltip: '삭제',
              onPressed: () => _confirmDelete(context, ref),
            ),
          ],
        ],
      ),
      body: async.when(
        data: (post) => SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              AspectRatio(
                aspectRatio: 16 / 9,
                child: CachedNetworkImage(
                  imageUrl: toAbsoluteUrl(post.imageUrl),
                  fit: BoxFit.cover,
                  placeholder: (context, url) => const Center(
                    child: CircularProgressIndicator(),
                  ),
                  errorWidget: (context, url, error) =>
                      const Icon(Icons.broken_image, size: 48),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      post.title,
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${post.authorNickname} · ${post.createdAt}',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                    const SizedBox(height: 16),
                    Text(post.content),
                    if (post.latitude != null && post.longitude != null) ...[
                      const SizedBox(height: 24),
                      ListTile(
                        leading: const Icon(Icons.location_on),
                        title: const Text('위치 정보'),
                        subtitle: Text(
                          '${post.latitude}, ${post.longitude}',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                        onTap: () {
                          // Step 6에서 지도 연동
                        },
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
        loading: () => const LoadingWidget(),
        error: (e, _) => AppErrorView(
          message: e.toString(),
          onRetry: () => ref.invalidate(imagePostDetailProvider(postId)),
        ),
      ),
    );
  }
}
