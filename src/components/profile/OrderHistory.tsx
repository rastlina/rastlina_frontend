import { Package, Clock, CheckCircle, Truck, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const ORDER_STATUS_CONFIG: any = {
  Pending:    { color: 'text-yellow-600 bg-yellow-50', icon: Clock, label: 'Pending' },
  Confirmed:  { color: 'text-primary bg-primary/10', icon: CheckCircle, label: 'Confirmed' },
  Shipped:    { color: 'text-purple-600 bg-purple-50', icon: Truck, label: 'Shipped' },
  Delivered:  { color: 'text-green-600 bg-green-50', icon: CheckCircle, label: 'Delivered' },
};

export default function OrderHistory({ orders }: { orders: any[] }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 bg-card rounded-2xl border border-border/30">
        <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="font-semibold text-foreground">No orders yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map(order => {
        const isExpanded = expandedId === order.id;
        const status = ORDER_STATUS_CONFIG[order.order_status] || ORDER_STATUS_CONFIG.Pending;
        const StatusIcon = status.icon;

        return (
          <div key={order.id} className="bg-card rounded-2xl border border-border/30 overflow-hidden">
            {/* Summary Row */}
            <div 
              onClick={() => setExpandedId(isExpanded ? null : order.id)}
              className="p-5 cursor-pointer flex items-center gap-4 hover:bg-muted/5 transition-colors"
            >
              <div className="w-12 h-12 bg-muted/30 rounded-xl flex items-center justify-center shrink-0">
                <Package className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <p className="font-bold text-sm">Order #{order.id}</p>
                  <span className="font-bold text-sm">₹{order.total_amount}</span>
                </div>
                <div className="flex gap-2 mt-1">
                  <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${status.color}`}>
                    <StatusIcon className="w-3 h-3" /> {status.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>

            {/* Details Panel */}
            {isExpanded && (
              <div className="p-5 border-t border-border/10 bg-muted/5 space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Items</p>
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.product_name} x {item.quantity}</span>
                      <span className="font-medium">₹{item.item_total}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-border/10 flex justify-between font-bold text-sm">
                  <span>Total Amount Paid</span>
                  <span>₹{order.total_amount}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}