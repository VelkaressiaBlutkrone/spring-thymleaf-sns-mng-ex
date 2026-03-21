package com.example.sns.controller.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.sns.domain.User;
import com.example.sns.exception.BusinessException;
import com.example.sns.exception.ErrorCode;
import com.example.sns.service.AuthService;
import com.example.sns.service.FollowService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;
    private final AuthService authService;

    @PostMapping("/users/{id}/follow")
    public ResponseEntity<Void> follow(@PathVariable Long id) {
        User currentUser = authService.getCurrentUserEntity()
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
        followService.follow(currentUser.getId(), id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/users/{id}/follow")
    public ResponseEntity<Void> unfollow(@PathVariable Long id) {
        User currentUser = authService.getCurrentUserEntity()
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
        followService.unfollow(currentUser.getId(), id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/profile/following-ids")
    public ResponseEntity<List<Long>> getFollowingIds() {
        User currentUser = authService.getCurrentUserEntity()
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
        return ResponseEntity.ok(followService.getFollowingIds(currentUser.getId()));
    }
}
