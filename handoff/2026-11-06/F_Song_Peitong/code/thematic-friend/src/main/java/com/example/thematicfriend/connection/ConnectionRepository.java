package com.example.thematicfriend.connection;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface ConnectionRepository extends JpaRepository<Connection,Long> {
    Optional<Connection> findByLowIdAndHighId(Long low,Long high);
    List<Connection> findByLowIdOrHighIdOrderByCreatedAtDesc(Long low,Long high);
}
