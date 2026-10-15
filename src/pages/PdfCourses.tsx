import { Navigate } from 'react-router-dom';

export function PdfCourses() {
  return <Navigate to="/courses?type=pdf" replace />;
}
