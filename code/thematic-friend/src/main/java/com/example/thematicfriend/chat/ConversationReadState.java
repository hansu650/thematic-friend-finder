package com.example.thematicfriend.chat;

import jakarta.persistence.*;

@Entity
@Table(name = "conversation_read_states",
        uniqueConstraints = @UniqueConstraint(columnNames = {"connection_id", "participant_id"}))
public class ConversationReadState {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "connection_id", nullable = false)
    private Long connectionId;
    @Column(name = "participant_id", nullable = false)
    private Long participantId;
    @Column(nullable = false)
    private Long lastReadMessageId = 0L;

    protected ConversationReadState() { }

    public ConversationReadState(Long connectionId, Long participantId) {
        this.connectionId = connectionId;
        this.participantId = participantId;
    }

    public Long getLastReadMessageId() { return lastReadMessageId; }

    public void advanceTo(Long messageId) {
        if (messageId > lastReadMessageId) lastReadMessageId = messageId;
    }
}
