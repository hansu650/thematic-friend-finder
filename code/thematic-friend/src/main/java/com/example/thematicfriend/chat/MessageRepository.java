package com.example.thematicfriend.chat;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface MessageRepository extends JpaRepository<Message,Long> {
    List<Message> findTop100ByConnectionIdOrderByIdDesc(Long id);
    List<Message> findTop100ByConnectionIdAndIdGreaterThanOrderByIdAsc(Long id,Long after);
    List<Message> findTop101ByConnectionIdAndIdLessThanOrderByIdDesc(Long id,Long before);
    Optional<Message> findTopByConnectionIdOrderByIdDesc(Long id);
    Optional<Message> findByIdAndConnectionId(Long id, Long connectionId);
    long countByConnectionIdAndSenderIdNotAndIdGreaterThan(Long connectionId, Long senderId, Long messageId);
}
