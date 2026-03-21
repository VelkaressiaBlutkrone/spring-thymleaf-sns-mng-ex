// 회원 저장소. doc/API_SPEC.md 2(회원)
import 'package:dio/dio.dart';

import '../../core/constants/api_constants.dart';
import '../../core/error/app_exception.dart';
import '../../domain/models/models.dart';
import '../api/api_client.dart';

/// 회원 저장소
class MemberRepository {
  MemberRepository({required ApiClient apiClient}) : _api = apiClient;

  final ApiClient _api;

  /// 회원가입: POST /api/members
  Future<MemberResponse> join(MemberJoinRequest request) async {
    try {
      final res = await _api.post(
        ApiConstants.members,
        data: request.toJson(),
        options: Options(extra: {'skipAuth': true}),
      );
      return MemberResponse.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _mapDioException(e);
    }
  }

  /// 개인정보 수정: PUT /api/me
  Future<MemberResponse> updateMe(MemberUpdateRequest request) async {
    try {
      final res = await _api.put(
        ApiConstants.me,
        data: request.toJson(),
      );
      return MemberResponse.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _mapDioException(e);
    }
  }

  AppException _mapDioException(DioException e) {
    if (e.response != null) {
      final status = e.response!.statusCode ?? 0;
      final data = e.response!.data;
      if (data is Map<String, dynamic>) {
        try {
          final err = ErrorResponse.fromJson(data);
          return ApiException.detailed(
            err.code,
            err.message,
            err.fieldErrors
                .map((f) => FieldErrorDto(
                      field: f.field,
                      value: f.value,
                      reason: f.reason,
                    ))
                .toList(),
          );
        } catch (_) {}
      }
      return switch (status) {
        401 => const UnauthorizedException(),
        403 => const ForbiddenException(),
        404 => const NotFoundException(),
        429 => const RateLimitException(),
        _ => ApiException('서버 오류 ($status)'),
      };
    }
    return switch (e.type) {
      DioExceptionType.connectionTimeout ||
      DioExceptionType.receiveTimeout =>
        const NetworkException(),
      _ => const NetworkException(),
    };
  }
}
