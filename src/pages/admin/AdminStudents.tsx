import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { getAllUsers } from '../../lib/db';
import { Loader2 } from 'lucide-react';

export function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudents() {
      try {
        const fetchedUsers = await getAllUsers();
        // Assuming roles are 'student' and 'admin'
        setStudents(fetchedUsers.filter(u => u.role === 'student' || !u.role));
      } catch (error) {
        console.error("Failed to load students:", error);
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Students</h1>
        <p className="text-slate-400 mt-2">Manage enrolled students across your platform.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-900/50 text-xs uppercase text-slate-300">
                <tr>
                  <th scope="col" className="px-6 py-4">Student Name</th>
                  <th scope="col" className="px-6 py-4">Email</th>
                  <th scope="col" className="px-6 py-4">Joined Date</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                      Loading students...
                    </td>
                  </tr>
                ) : students.length > 0 ? (
                  students.map((student) => (
                    <tr key={student.uid} className="hover:bg-slate-900/50">
                      <td className="px-6 py-4 font-medium text-white">{student.name || 'Unnamed'}</td>
                      <td className="px-6 py-4">{student.email}</td>
                      <td className="px-6 py-4">{student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
