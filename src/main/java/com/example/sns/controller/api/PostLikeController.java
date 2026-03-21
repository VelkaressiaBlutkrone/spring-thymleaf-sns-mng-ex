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
import com.example.sns.service.PostLikeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PostLikeController {

    private final PostLikeService postLikeService;
    private final AuthService authService;

    @PostMapping("/posts/{id}/like")
    public ResponseEntity<Void> like(@PathVariable Long id) {
        User currentUser = authService.getCurrentUserEntity()
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
        postLikeService.like(currentUser.getId(), id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/posts/{id}/like")
    public ResponseEntity<Void> unlike(@PathVariable Long id) {
        User currentUser = authService.getCurrentUserEntity()
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
        postLikeService.unlike(currentUser.getId(), id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/profile/liked-post-ids")
    public ResponseEntity<List<Long>> getLikedPostIds() {
        User currentUser = authService.getCurrentUserEntity()
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
        return ResponseEntity.ok(postLikeService.getLikedPostIds(currentUser.getId()));
    }
}
