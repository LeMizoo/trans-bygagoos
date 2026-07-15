import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../stores/authStore';
import apiClient from '../api/client';

export default function CoursesPage() {
  const { chauffeur } = useAuth();

  const { data } = useQuery({
    queryKey: ['courses', chauffeur?.id],
    queryFn: () => apiClient.get(`/courses?chauffeurId=${chauffeur?.id}`).then(r => r.data).catch(() => []),
    enabled: !!chauffeur?.id,
  });

  const courses = (Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []).slice(0, 50);

  return (
    <div>
      {courses.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center', padding: 20 }}>Aucune course</p>
      ) : (
        courses.map((course: any) => (
          <div key={course.id} className="course-item">
            <div>
              <div style={{ fontWeight: 'bold', color: '#DAA520', fontSize: 12 }}>
                {course.type === 'NORMALE' ? '🚖 Course' :
                 course.type === 'ADY_VAROTRA' ? '🛺 Ady Varotra' : '📅 Location'}
              </div>
              <div className="course-date">
                {new Date(course.createdAt).toLocaleString('fr')}
              </div>
            </div>
            <div className="course-price">{course.prix?.toLocaleString()} Ar</div>
          </div>
        ))
      )}
    </div>
  );
}
