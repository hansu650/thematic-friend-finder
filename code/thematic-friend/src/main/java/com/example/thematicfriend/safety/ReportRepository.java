package com.example.thematicfriend.safety;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
public interface ReportRepository extends JpaRepository<Report,Long> {
    List<Report> findByReporterIdOrderByCreatedAtDesc(Long reporter);
    List<Report> findAllByOrderByCreatedAtDesc();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from Report r where r.id = :id")
    Optional<Report> findForReview(Long id);
}
