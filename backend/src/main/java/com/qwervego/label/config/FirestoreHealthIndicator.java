import com.google.cloud.firestore.Firestore;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
public class FirestoreHealthIndicator implements HealthIndicator {

    private final Firestore firestore;

    public FirestoreHealthIndicator(Firestore firestore) {
        this.firestore = firestore;
    }

    @Override
    public Health health() {
        try {
            // Try a simple Firestore operation (list collections)
            firestore.listCollections(); // This will throw if not connected
            return Health.up().withDetail("firestore", "Connected").build();
        } catch (Exception e) {
            return Health.down(e).withDetail("firestore", "Not connected").build();
        }
    }
}