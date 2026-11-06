package com.example.thematicfriend.safety;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface BlockRepository extends JpaRepository<Block,Long> {
    boolean existsByActorIdAndTargetId(Long actor,Long target);
    List<Block> findByActorId(Long actor);
    void deleteByActorIdAndTargetId(Long actor,Long target);
}
