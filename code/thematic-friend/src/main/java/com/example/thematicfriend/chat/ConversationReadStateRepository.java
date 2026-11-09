package com.example.thematicfriend.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ConversationReadStateRepository extends JpaRepository<ConversationReadState, Long> {
    Optional<ConversationReadState> findByConnectionIdAndParticipantId(Long connectionId, Long participantId);
}
