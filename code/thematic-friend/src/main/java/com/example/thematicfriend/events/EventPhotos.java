package com.example.thematicfriend.events;

import org.springframework.stereotype.Component;
import java.util.Set;

/** Maps older event covers to the current local library without rewriting event data. */
@Component("eventPhotos")
public class EventPhotos {
    private static final Set<String> FILES=Set.of("coffee-table.jpg","city-walk.jpg","photo-walk.jpg","book-club.jpg",
            "live-music.jpg","gallery.jpg","trail.jpg","board-games.jpg","food-table.jpg","running.jpg","film-night.jpg",
            "travel.jpg","vinyl.jpg","weekend-market.jpg","coffee-chat.jpg","picnic.jpg","ceramics.jpg","night-photo.jpg");
    public String url(CommunityEvent event){
        String file=FILES.contains(event.getImage())?event.getImage():imageFor(event.getCategory());
        return "/images/activity-photos/"+file;
    }
    public static String imageFor(String category){return switch(category){
        case "Reading" -> "book-club.jpg";
        case "Films" -> "film-night.jpg";
        case "Music" -> "live-music.jpg";
        case "Photography" -> "photo-walk.jpg";
        case "Travel" -> "travel.jpg";
        case "Sport" -> "running.jpg";
        case "Gaming" -> "board-games.jpg";
        case "Food" -> "food-table.jpg";
        case "Hiking" -> "city-walk.jpg";
        case "Art" -> "gallery.jpg";
        default -> "coffee-chat.jpg";
    };}
}
