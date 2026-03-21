package com.example.sns.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.sns.domain.SavedRoute;
import com.example.sns.domain.User;
import com.example.sns.dto.request.SavedRouteCreateRequest;
import com.example.sns.dto.response.SavedRouteResponse;
import com.example.sns.exception.BusinessException;
import com.example.sns.exception.ErrorCode;
import com.example.sns.repository.SavedRouteRepository;
import com.example.sns.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SavedRouteService {

    private final SavedRouteRepository savedRouteRepository;
    private final UserRepository userRepository;

    @Transactional
    public SavedRouteResponse save(Long userId, SavedRouteCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        SavedRoute route = SavedRoute.builder()
                .user(user)
                .name(request.name())
                .points(request.points())
                .path(request.path())
                .distance(request.distance())
                .duration(request.duration())
                .transportMode(request.transportMode())
                .build();

        return SavedRouteResponse.from(savedRouteRepository.save(route));
    }

    public Page<SavedRouteResponse> getByUser(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        return savedRouteRepository.findByUserOrderByCreatedAtDesc(user, pageable)
                .map(SavedRouteResponse::from);
    }

    @Transactional
    public void delete(Long routeId, Long userId) {
        SavedRoute route = savedRouteRepository.findById(routeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        if (!route.isOwner(user)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        savedRouteRepository.delete(route);
    }
}
