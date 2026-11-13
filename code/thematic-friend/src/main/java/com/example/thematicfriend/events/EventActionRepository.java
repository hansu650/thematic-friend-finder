package com.example.thematicfriend.events;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EventActionRepository extends JpaRepository<EventAction,Long> {
    boolean existsByEventIdAndMemberIdAndKind(Long eventId,Long memberId,EventAction.Kind kind);
    long countByEventIdAndKind(Long eventId,EventAction.Kind kind);
    void deleteByEventIdAndMemberIdAndKind(Long eventId,Long memberId,EventAction.Kind kind);
    List<EventAction> findByEventIdAndKind(Long eventId,EventAction.Kind kind);
}
