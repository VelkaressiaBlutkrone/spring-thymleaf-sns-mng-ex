// 게시글 저장소. doc/API_SPEC.md 4, TASK_MOBILE Step 5
import 'package:dio/dio.dart';

import '../../core/constants/api_constants.dart';
import '../../core/error/exception_mapper.dart';
import '../../domain/models/models.dart';
import '../api/api_client.dart';

/// 게시글 저장소
class PostRepository {
  PostRepository({required ApiClient apiClient}) : _api = apiClient;

  final ApiClient _api;

  /// 게시글 목록: GET /api/posts (page, size, keyword)
  Future<PageResponse<PostResponse>> getList({
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
        ApiConstants.posts,
        queryParameters: queryParams,
        options: Options(extra: {'skipAuth': true}),
      );
      return PageResponse.fromJson(
        res.data as Map<String, dynamic>,
        (json) => PostResponse.fromJson(Map<String, dynamic>.from(json)),
      );
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  /// 게시글 상세: GET /api/posts/{id}
  Future<PostResponse> getById(int id) async {
    try {
      final res = await _api.get(
        '${ApiConstants.posts}/$id',
        options: Options(extra: {'skipAuth': true}),
      );
      return PostResponse.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  /// 게시글 작성: POST /api/posts
  Future<PostResponse> create(PostCreateRequest request) async {
    try {
      final res = await _api.post(
        ApiConstants.posts,
        data: request.toJson(),
      );
      return PostResponse.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  /// 게시글 수정: PUT /api/posts/{id}
  Future<PostResponse> update(int id, PostUpdateRequest request) async {
    try {
      final res = await _api.put(
        '${ApiConstants.posts}/$id',
        data: request.toJson(),
      );
      return PostResponse.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  /// 게시글 삭제: DELETE /api/posts/{id}
  Future<void> delete(int id) async {
    try {
      await _api.delete('${ApiConstants.posts}/$id');
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  /// 반경 내 게시글 목록: GET /api/posts/nearby
  Future<PageResponse<PostResponse>> getNearby({
    required double lat,
    required double lng,
    required double radiusKm,
    int page = 0,
    int size = 20,
  }) async {
    try {
      final res = await _api.get(
        ApiConstants.postsNearby,
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
        (json) => PostResponse.fromJson(Map<String, dynamic>.from(json)),
      );
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  /// 내 게시글 목록: GET /api/me/posts
  Future<PageResponse<PostResponse>> getMine({
    int page = 0,
    int size = 20,
  }) async {
    try {
      final res = await _api.get(
        ApiConstants.mePosts,
        queryParameters: {'page': page, 'size': size},
      );
      return PageResponse.fromJson(
        res.data as Map<String, dynamic>,
        (json) => PostResponse.fromJson(Map<String, dynamic>.from(json)),
      );
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  /// Pin별 게시글 목록: GET /api/pins/{id}/posts
  Future<PageResponse<PostResponse>> getByPinId(
    int pinId, {
    int page = 0,
    int size = 20,
  }) async {
    try {
      final res = await _api.get(
        '${ApiConstants.pins}/$pinId/posts',
        queryParameters: {
          'page': page,
          'size': size,
        },
        options: Options(extra: {'skipAuth': true}),
      );
      return PageResponse.fromJson(
        res.data as Map<String, dynamic>,
        (json) => PostResponse.fromJson(Map<String, dynamic>.from(json)),
      );
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }
}
