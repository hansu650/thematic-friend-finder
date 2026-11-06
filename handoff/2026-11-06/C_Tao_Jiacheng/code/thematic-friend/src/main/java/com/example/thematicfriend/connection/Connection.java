package com.example.thematicfriend.connection;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="connections",uniqueConstraints=@UniqueConstraint(columnNames={"low_id","high_id"}))
public class Connection {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(name="low_id",nullable=false) private Long lowId;
    @Column(name="high_id",nullable=false) private Long highId;
    private boolean active=true;
    private Instant createdAt=Instant.now();
    protected Connection() { }
    public Connection(Long a, Long b) { lowId=Math.min(a,b); highId=Math.max(a,b); }
    public Long getId() { return id; }
    public Long getLowId() { return lowId; }
    public Long getHighId() { return highId; }
    public boolean isActive() { return active; }
    public Instant getCreatedAt() { return createdAt; }
    public boolean contains(Long id) { return lowId.equals(id)||highId.equals(id); }
    public Long other(Long id) {
        if (!contains(id)) throw new IllegalArgumentException("Not a participant");
        return lowId.equals(id)?highId:lowId;
    }
    public void end() { active=false; }
}
