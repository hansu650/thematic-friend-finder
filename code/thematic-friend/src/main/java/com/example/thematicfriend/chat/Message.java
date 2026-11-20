package com.example.thematicfriend.chat;
import jakarta.persistence.*;
import java.time.Instant;
@Entity
@Table(name="chat_messages",indexes=@Index(columnList="connection_id,id"),
       uniqueConstraints=@UniqueConstraint(name="uk_chat_messages_sender_client",
               columnNames={"connection_id","sender_id","client_message_id"}))
public class Message {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(name="connection_id",nullable=false) private Long connectionId;
    @Column(nullable=false) private Long senderId;
    @Column(nullable=false,length=1000) private String body;
    @Column(name="client_message_id",length=64) private String clientMessageId;
    @Column(nullable=false) private Instant sentAt=Instant.now();
    protected Message() { }
    public Message(Long connection,Long sender,String body) { this(connection,sender,body,null); }
    public Message(Long connection,Long sender,String body,String clientMessageId) {
        connectionId=connection; senderId=sender; this.body=body; this.clientMessageId=clientMessageId;
    }
    public Long getId() { return id; }
    public Long getSenderId() { return senderId; }
    public String getBody() { return body; }
    public String getClientMessageId() { return clientMessageId; }
    public Instant getSentAt() { return sentAt; }
}
