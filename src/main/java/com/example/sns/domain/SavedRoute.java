package com.example.sns.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "saved_routes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SavedRoute extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String points;

    @Column(columnDefinition = "TEXT")
    private String path;

    private Double distance;

    private Integer duration;

    @Column(length = 20, name = "transport_mode")
    private String transportMode;

    @Builder
    public SavedRoute(User user, String name, String points, String path,
                      Double distance, Integer duration, String transportMode) {
        this.user = user;
        this.name = name;
        this.points = points;
        this.path = path;
        this.distance = distance;
        this.duration = duration;
        this.transportMode = transportMode;
        onCreate();
    }

    public boolean isOwner(User user) {
        return user != null && this.user != null && this.user.getId().equals(user.getId());
    }
}
