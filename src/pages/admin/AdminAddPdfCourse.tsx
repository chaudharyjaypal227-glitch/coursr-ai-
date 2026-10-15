import { Navigate, useSearchParams } from 'react-router-dom';

export function AdminAddPdfCourse() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  return <Navigate to={id ? `/admin/courses/new?id=${id}` : '/admin/courses/new?type=pdf'} replace />;
}
