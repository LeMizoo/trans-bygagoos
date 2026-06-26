import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API = 'https://trans-bygagoos.onrender.com/api/v1';
const token = () => localStorage.getItem('chauffeur-token') || '';
const chauffeur = () => JSON.parse(localStorage.getItem('chauffeur') || '{}');

export function CoursesPage() {
  const c = chauffeur();
  const { data } = useQuery({
    queryKey: ['courses', c?.id],
    queryFn: () => axios.get(`${API}/courses`, { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.data).catch(() => []),
    enabled: !!c?.id,
    refetchInterval: 10000,
  });
  const courses = Array.isArray(data) ? data : [];
  return (
    <div style={{ padding: 12 }}>
      <h1 style={{ color: '#DAA520', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📋 Mes courses</h1>
      {courses.length === 0 ? (
        <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 20, textAlign: 'center', color: '#888' }}>Aucune course</div>
      ) : courses.slice(0, 50).map((course: any) => (
        <div key={course.id} style={{ background: '#1a1a1a', borderRadius: 10, padding: 12, marginBottom: 8, display: 'flex', justifyContent: 'space-between', border: '1px solid #2a2a2a' }}>
          <div><div style={{ color: '#DAA520', fontWeight: 600, fontSize: 13 }}>{course.type || 'Course'}</div><div style={{ fontSize: 10, color: '#888' }}>{new Date(course.createdAt).toLocaleString('fr')}</div></div>
          <div style={{ fontWeight: 700, color: '#DAA520', fontSize: 15 }}>{course.prix?.toLocaleString()} Ar</div>
        </div>
      ))}
    </div>
  );
}
