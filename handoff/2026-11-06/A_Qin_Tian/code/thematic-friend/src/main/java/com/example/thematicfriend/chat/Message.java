package com.example.thematicfriend.chat;
import jakarta.persistence.*;
import java.time.Instant;
@Entity
@Table(name="chat_messages",indexes=@Index(columnList="connection_id,id"))
public class Message {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(name="connection_id",nullable=false) private Long connectionId;
    @Column(nullable=false) private Long senderId;
    @Column(nullable=false,length=1000) private String body;
    @Column(nullable=false) private Instant sentAt=Instant.now();
    protected Message() { }
    public Message(Long connection,Long sender,String body) { connectionId=connection; senderId=sender; this.body=body; }
    public Long getId() { return id; }
    public Long getSenderId() { return senderId; }
    public String getBody() { return body; }
    public Instant getSentAt() { return sentAt; }
}
