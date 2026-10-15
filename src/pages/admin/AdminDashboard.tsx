import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { BookOpen, Users, ShoppingCart, DollarSign, Loader2 } from 'lucide-react';
import { getAllCourses, getAllUsers, getAllOrders } from '../../lib/db';
import { Course, Order } from '../../types';

export function AdminDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedCourses, fetchedUsers, fetchedOrders] = await Promise.all([
          getAllCourses(),
          getAllUsers(),
          getAllOrders()
        ]);
        setCourses(fetchedCourses);
        setUsers(fetchedUsers);
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalRevenue = orders.reduce((acc, order) => acc + order.amount, 0);

  if (loading) {
    return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard Overview</h1>
        <p className="text-slate-400 mt-2">Welcome to the CourseAI admin panel.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-slate-500">From all completed orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{users.filter(u => u.role === 'student').length}</div>
            <p className="text-xs text-slate-500">Registered students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{courses.length}</div>
            <p className="text-xs text-slate-500">Active on platform</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{orders.length}</div>
            <p className="text-xs text-slate-500">Purchased courses</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.length > 0 ? orders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center justify-between border-b border-slate-800 pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-white">{order.userId}</p> {/* Ideally fetch user name */}
                    <p className="text-xs text-slate-500">{order.courseId}</p> {/* Ideally fetch course title */}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">${order.amount}</p>
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                      {order.status}
                    </span>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-400 py-4 text-center">No orders yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.filter(u => u.role === 'student').slice(0, 5).map(user => (
                <div key={user.uid} className="flex items-center gap-4 border-b border-slate-800 pb-4 last:border-0 last:pb-0">
                  <div className="h-8 w-8 rounded-full bg-slate-800 overflow-hidden shrink-0">
                    <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
              ))}
              {users.filter(u => u.role === 'student').length === 0 && (
                <p className="text-sm text-slate-400 py-4 text-center">No students registered yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
