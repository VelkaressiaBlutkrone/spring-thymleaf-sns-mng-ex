package com.example.sns.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.sns.domain.SavedRoute;
import com.example.sns.domain.User;

public interface SavedRouteRepository extends JpaRepository<SavedRoute, Long> {

    Page<SavedRoute> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
}
