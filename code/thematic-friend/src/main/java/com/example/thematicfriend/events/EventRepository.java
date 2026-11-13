package com.example.thematicfriend.events;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface EventRepository extends JpaRepository<CommunityEvent,Long> {
    List<CommunityEvent> findAllByOrderByStartsAtAsc();
    boolean existsByHostIdAndTitle(Long hostId,String title);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from CommunityEvent e where e.id=:id")
    Optional<CommunityEvent> lockById(@Param("id") Long id);
}
