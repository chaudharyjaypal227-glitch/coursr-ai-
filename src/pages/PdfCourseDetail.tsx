import { useParams, Navigate } from 'react-router-dom';

export function PdfCourseDetail() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/courses/${id || ''}`} replace />;
}
