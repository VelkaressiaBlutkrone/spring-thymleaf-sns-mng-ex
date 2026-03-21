// 이미지 게시글 저장소. doc/API_SPEC.md 5, TASK_MOBILE Step 5
import 'package:dio/dio.dart';

import '../../core/constants/api_constants.dart';
import '../../core/error/exception_mapper.dart';
import '../../domain/models/image_post_response.dart';
import '../../domain/models/page_response.dart';
import '../api/api_client.dart';

/// 이미지 게시글 저장소
class ImagePostRepository {
  ImagePostRepository({required ApiClient apiClient}) : _api = apiClient;

  final ApiClient _api;

  /// 이미지 게시글 목록: GET /api/image-posts (page, size, keyword)
  Future<PageResponse<ImagePostResponse>> getList({
    int page = 0,
    int size = 20,
    String? keyword,
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'size': size,
    };
    if (keyword != null && keyword.isNotEmpty) {
      queryParams['keyword'] = keyword;
    }
    try {
      final res = await _api.get(
        ApiConstants.imagePosts,
        queryParameters: queryParams,
        options: Options(extra: {'skipAuth': true}),
      );
      return PageResponse.fromJson(
        res.data as Map<String, dynamic>,
        (json) => ImagePostResponse.fromJson(Map<String, dynamic>.from(json)),
      );
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  /// 이미지 게시글 상세: GET /api/image-posts/{id}
  Future<ImagePostResponse> getById(int id) async {
    try {
      final res = await _api.get(
        '${ApiConstants.imagePosts}/$id',
        options: Options(extra: {'skipAuth': true}),
      );
      return ImagePostResponse.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  /// 이미지 게시글 작성: POST /api/image-posts (multipart/form-data)
  Future<ImagePostResponse> create({
    required String title,
    required String content,
    required String imagePath,
    double? latitude,
    double? longitude,
    int? pinId,
  }) async {
    try {
      final formData = FormData.fromMap({
        'title': title,
        'content': content,
        'image': await MultipartFile.fromFile(
          imagePath,
          filename: _extractFileName(imagePath),
        ),
        if (latitude != null) 'latitude': latitude,
        if (longitude != null) 'longitude': longitude,
        if (pinId != null) 'pinId': pinId,
      });

      final res = await _api.post(
        ApiConstants.imagePosts,
        data: formData,
        options: Options(contentType: 'multipart/form-data'),
      );
      return ImagePostResponse.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  /// 이미지 게시글 수정: PUT /api/image-posts/{id} (multipart/form-data)
  Future<ImagePostResponse> update(
    int id, {
    required String title,
    required String content,
    String? imagePath,
    double? latitude,
    double? longitude,
    int? pinId,
  }) async {
    try {
      final formData = FormData.fromMap({
        'title': title,
        'content': content,
        if (imagePath != null && imagePath.isNotEmpty)
          'image': await MultipartFile.fromFile(
            imagePath,
            filename: _extractFileName(imagePath),
          ),
        if (latitude != null) 'latitude': latitude,
        if (longitude != null) 'longitude': longitude,
        if (pinId != null) 'pinId': pinId,
      });

      final res = await _api.put(
        '${ApiConstants.imagePosts}/$id',
        data: formData,
        options: Options(contentType: 'multipart/form-data'),
      );
      return ImagePostResponse.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  /// 이미지 게시글 삭제: DELETE /api/image-posts/{id}
  Future<void> delete(int id) async {
    try {
      await _api.delete('${ApiConstants.imagePosts}/$id');
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  /// 반경 내 이미지 게시글 목록: GET /api/image-posts/nearby
  Future<PageResponse<ImagePostResponse>> getNearby({
    required double lat,
    required double lng,
    required double radiusKm,
    int page = 0,
    int size = 20,
  }) async {
    try {
      final res = await _api.get(
        ApiConstants.imagePostsNearby,
        queryParameters: {
          'lat': lat,
          'lng': lng,
          'radiusKm': radiusKm,
          'page': page,
          'size': size,
        },
        options: Options(extra: {'skipAuth': true}),
      );
      return PageResponse.fromJson(
        res.data as Map<String, dynamic>,
        (json) => ImagePostResponse.fromJson(Map<String, dynamic>.from(json)),
      );
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  /// 내 이미지 게시글 목록: GET /api/me/image-posts
  Future<PageResponse<ImagePostResponse>> getMine({
    int page = 0,
    int size = 20,
  }) async {
    try {
      final res = await _api.get(
        ApiConstants.meImagePosts,
        queryParameters: {'page': page, 'size': size},
      );
      return PageResponse.fromJson(
        res.data as Map<String, dynamic>,
        (json) => ImagePostResponse.fromJson(Map<String, dynamic>.from(json)),
      );
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  /// Pin별 이미지 게시글 목록: GET /api/pins/{id}/image-posts
  Future<PageResponse<ImagePostResponse>> getByPinId(
    int pinId, {
    int page = 0,
    int size = 20,
  }) async {
    try {
      final res = await _api.get(
        '${ApiConstants.pins}/$pinId/image-posts',
        queryParameters: {
          'page': page,
          'size': size,
        },
        options: Options(extra: {'skipAuth': true}),
      );
      return PageResponse.fromJson(
        res.data as Map<String, dynamic>,
        (json) => ImagePostResponse.fromJson(Map<String, dynamic>.from(json)),
      );
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  String _extractFileName(String path) {
    final normalized = path.replaceAll('\\', '/');
    final idx = normalized.lastIndexOf('/');
    return idx >= 0 ? normalized.substring(idx + 1) : normalized;
  }
}
