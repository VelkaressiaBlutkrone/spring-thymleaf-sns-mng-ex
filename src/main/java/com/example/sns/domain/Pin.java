package com.example.sns.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 지도 Pin 엔티티.
 *
 * ERD: Pin (user_id FK, description, latitude, longitude).
 * Step 10: Location VO 활용, Pin↔Post/ImagePost 연관(Post·ImagePost가 Pin 참조).
 */
@Entity
@Table(name = "pins")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Pin extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User owner;

    @Column(length = 200)
    private String title;

    @Column(length = 500)
    private String description;

    @Column(length = 50)
    private String category;

    @Embedded
    private Location location;

    @Builder
    public Pin(User owner, String title, String description, String category,
               Double latitude, Double longitude) {
        this.owner = owner;
        this.title = title;
        this.description = description;
        this.category = category != null ? category : "default";
        this.location = new Location(latitude, longitude);
        onCreate();
    }

    public void update(String title, String description, String category,
                       Double latitude, Double longitude) {
        this.title = title;
        this.description = description;
        this.category = category;
        if (latitude != null && longitude != null) {
            this.location = new Location(latitude, longitude);
        }
        onUpdate();
    }

    public boolean isOwner(User user) {
        return user != null && owner != null && owner.getId().equals(user.getId());
    }

    public Double getLatitude() {
        return location != null ? location.getLatitude() : null;
    }

    public Double getLongitude() {
        return location != null ? location.getLongitude() : null;
    }
}
