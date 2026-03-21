package com.example.sns.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 회원 엔티티.
 *
 * ERD: User (email UK, password_hash, nickname, role).
 */
@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseEntity {

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, length = 255, name = "password_hash")
    private String passwordHash;

    @Column(nullable = false, length = 100)
    private String nickname;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role;

    @Column(length = 500)
    private String bio;

    @Column(length = 500, name = "profile_pic")
    private String profilePic;

    @Builder
    public User(String email, String passwordHash, String nickname, UserRole role) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.nickname = nickname;
        this.role = role != null ? role : UserRole.USER;
        onCreate();
    }

    public void updatePassword(String passwordHash) {
        this.passwordHash = passwordHash;
        onUpdate();
    }

    public void updateNickname(String nickname) {
        this.nickname = nickname;
        onUpdate();
    }

    public void updateProfile(String nickname, String bio, String profilePic) {
        if (nickname != null && !nickname.isBlank()) {
            this.nickname = nickname;
        }
        this.bio = bio;
        this.profilePic = profilePic;
        onUpdate();
    }

    /**
     * 관리자용 프로필·역할 수정.
     */
    public void updateByAdmin(String nickname, UserRole role) {
        if (nickname != null && !nickname.isBlank()) {
            this.nickname = nickname;
        }
        if (role != null) {
            this.role = role;
        }
        onUpdate();
    }
}
