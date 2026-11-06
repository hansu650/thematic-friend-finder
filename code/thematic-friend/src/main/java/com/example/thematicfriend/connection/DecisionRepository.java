package com.example.thematicfriend.connection;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface DecisionRepository extends JpaRepository<Decision,Long> {
    Optional<Decision> findByActorIdAndTargetId(Long actor, Long target);
    List<Decision> findByActorId(Long actor);
    void deleteByActorIdAndChoice(Long actor, Decision.Choice choice);
}
