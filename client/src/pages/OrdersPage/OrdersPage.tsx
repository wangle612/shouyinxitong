import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { SearchIcon, EyeIcon, CalendarIcon, ReceiptIcon, PackageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ICartItem {
  code: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  subtotal: number;
}

interface IOrder {
  id: string;
  timestamp: number;
  items: ICartItem[];
  totalCount: number;
  totalAmount: number;
  receivedAmount: number;
  changeAmount: number;
}

const ORDERS_STORAGE_KEY = '__global_cashier_orders';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    try {
      const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setOrders(parsed.sort((a: IOrder, b: IOrder) => b.timestamp - a.timestamp));
        }
      }
    } catch {
      toast.error('加载订单数据失败');
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = !searchQuery || 
        order.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDate = !dateFilter || 
        new Date(order.timestamp).toISOString().split('T')[0] === dateFilter;
      
      return matchesSearch && matchesDate;
    });
  }, [orders, searchQuery, dateFilter]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toFixed(2)}`;
  };

  const handleViewDetail = (order: IOrder) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setDateFilter('');
  };

  const todayOrders = orders.filter(o => {
    const today = new Date().toDateString();
    return new Date(o.timestamp).toDateString() === today;
  });

  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <>
      <style jsx>{`
        .orders-page {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .amount-cell {
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
        }
      `}</style>

      <div className="orders-page w-full space-y-6">
        {/* 统计卡片 */}
        <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <ReceiptIcon className="size-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">总订单数</p>
                  <p className="text-2xl font-bold">{orders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-success/10">
                  <PackageIcon className="size-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">今日订单</p>
                  <p className="text-2xl font-bold">{todayOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-warning/10">
                  <CalendarIcon className="size-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">今日营收</p>
                  <p className="text-2xl font-bold amount-cell">{formatCurrency(todayRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 筛选和搜索 */}
        <section className="w-full">
          <Card>
            <CardHeader>
              <CardTitle>订单历史</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索订单号..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-40"
                  />
                  {(searchQuery || dateFilter) && (
                    <Button variant="ghost" onClick={handleClearFilters}>
                      清除筛选
                    </Button>
                  )}
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <ReceiptIcon className="size-6" />
                    </EmptyMedia>
                    <EmptyTitle>暂无订单</EmptyTitle>
                    <EmptyDescription>
                      {searchQuery || dateFilter ? '没有找到符合条件的订单' : '还没有任何交易记录'}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>订单号</TableHead>
                        <TableHead>日期</TableHead>
                        <TableHead className="text-right">商品数量</TableHead>
                        <TableHead className="text-right">总金额</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-accent/50">
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {order.id}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDateShort(order.timestamp)}
                          </TableCell>
                          <TableCell className="text-right">
                            {order.totalCount} 件
                          </TableCell>
                          <TableCell className="text-right font-semibold amount-cell">
                            {formatCurrency(order.totalAmount)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetail(order)}
                            >
                              <EyeIcon className="size-4 mr-1" />
                              详情
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* 订单详情弹窗 */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ReceiptIcon className="size-5" />
                订单详情
              </DialogTitle>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6">
                {/* 订单基本信息 */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">订单号</p>
                    <p className="font-mono font-medium">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">下单时间</p>
                    <p className="font-medium">{formatDate(selectedOrder.timestamp)}</p>
                  </div>
                </div>

                {/* 商品明细 */}
                <div>
                  <h4 className="font-medium mb-3">商品明细</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>商品名称</TableHead>
                          <TableHead className="text-right">单价</TableHead>
                          <TableHead className="text-right">数量</TableHead>
                          <TableHead className="text-right">小计</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.items.map((item, index) => (
                          <TableRow key={`${item.code}-${index}`}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-xs text-muted-foreground font-mono">
                                  {item.code}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right amount-cell">
                              {formatCurrency(item.price)}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.quantity} {item.unit}
                            </TableCell>
                            <TableCell className="text-right font-medium amount-cell">
                              {formatCurrency(item.subtotal)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* 金额汇总 */}
                <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">商品总数</span>
                    <span>{selectedOrder.totalCount} 件</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold">
                    <span>订单金额</span>
                    <span className="amount-cell text-primary">{formatCurrency(selectedOrder.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">实收金额</span>
                    <span className="amount-cell">{formatCurrency(selectedOrder.receivedAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">找零</span>
                    <span className="amount-cell text-success">{formatCurrency(selectedOrder.changeAmount)}</span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default OrdersPage;
