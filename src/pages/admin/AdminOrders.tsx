import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { getAllOrders } from '../../lib/db';
import { Order } from '../../types';
import { Loader2 } from 'lucide-react';

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const fetchedOrders = await getAllOrders();
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Failed to load orders:", error);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Orders</h1>
        <p className="text-slate-400 mt-2">View all platform transactions.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-900/50 text-xs uppercase text-slate-300">
                <tr>
                  <th scope="col" className="px-6 py-4">Order ID</th>
                  <th scope="col" className="px-6 py-4">User / Email</th>
                  <th scope="col" className="px-6 py-4">Type</th>
                  <th scope="col" className="px-6 py-4">Course</th>
                  <th scope="col" className="px-6 py-4">Amount</th>
                  <th scope="col" className="px-6 py-4">Date</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                      Loading orders...
                    </td>
                  </tr>
                ) : orders.length > 0 ? (
                  orders.map((order) => {
                    const isPdf = order.courseType === 'pdf' || (order.id && order.id.includes('pdf')) || (order.paymentId && order.paymentId.includes('pdf'));
                    return (
                      <tr key={order.id} className="hover:bg-slate-900/50">
                        <td className="px-6 py-4 font-mono text-xs text-slate-400">
                          <div>{order.id}</div>
                          {order.paymentId && (
                            <div className="text-[10px] text-slate-500 font-mono">Ref: {order.paymentId}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{order.userEmail || order.studentName || order.userId || 'Student'}</div>
                          {order.userId && order.userEmail && (
                            <div className="text-xs text-slate-500 font-mono">{order.userId.slice(0, 10)}...</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            isPdf 
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}>
                            {isPdf ? 'PDF Course' : 'Video Course'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-200 line-clamp-1">{order.courseTitle || order.courseId}</div>
                          <div className="text-xs text-slate-500 font-mono">{order.courseId}</div>
                        </td>
                        <td className="px-6 py-4 font-medium text-white">₹{order.amount}</td>
                        <td className="px-6 py-4">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      No orders found.
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
