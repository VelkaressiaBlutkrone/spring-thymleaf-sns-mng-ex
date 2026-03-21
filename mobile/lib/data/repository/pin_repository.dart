// Pin 저장소. doc/API_SPEC.md 6, TASK_MOBILE Step 7
import 'package:dio/dio.dart';

import '../../core/constants/api_constants.dart';
import '../../core/error/exception_mapper.dart';
import '../../domain/models/models.dart';
import '../api/api_client.dart';

/// Pin 조회 저장소
class PinRepository {
  PinRepository({required ApiClient apiClient}) : _api = apiClient;

  final ApiClient _api;

  /// 전체 Pin 목록: GET /api/pins
  Future<PageResponse<PinResponse>> getAll({
    int page = 0,
    int size = 50,
  }) async {
    try {
      final res = await _api.get(
        ApiConstants.pins,
        queryParameters: {
          'page': page,
          'size': size,
        },
      );
      return PageResponse.fromJson(
        res.data as Map<String, dynamic>,
        (json) => PinResponse.fromJson(Map<String, dynamic>.from(json)),
      );
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  /// 내 Pin 목록: GET /api/me/pins
  Future<PageResponse<PinResponse>> getMyPins({
    int page = 0,
    int size = 50,
  }) async {
    try {
      final res = await _api.get(
        ApiConstants.mePins,
        queryParameters: {'page': page, 'size': size},
      );
      return PageResponse.fromJson(
        res.data as Map<String, dynamic>,
        (json) => PinResponse.fromJson(Map<String, dynamic>.from(json)),
      );
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }

  /// 반경 내 Pin 조회: GET /api/pins/nearby
  Future<PageResponse<PinResponse>> getNearby({
    required double lat,
    required double lng,
    required double radiusKm,
    int page = 0,
    int size = 20,
  }) async {
    try {
      final res = await _api.get(
        ApiConstants.pinsNearby,
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
        (json) => PinResponse.fromJson(Map<String, dynamic>.from(json)),
      );
    } on DioException catch (e) {
      throw mapDioException(e);
    }
  }
}
