import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MinusIcon, PlusIcon, Trash2Icon, ShoppingCartIcon, RotateCcwIcon, CalculatorIcon } from 'lucide-react';
import { toast } from 'sonner';

interface IProduct {
  code: string;
  name: string;
  price: number;
  unit: string;
}

interface ICartItem extends IProduct {
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

const PRODUCTS_KEY = '__global_cashier_products';
const ORDERS_KEY = '__global_cashier_orders';

const getStoredProducts = (): IProduct[] => {
  try {
    const data = localStorage.getItem(PRODUCTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const getStoredOrders = (): IOrder[] => {
  try {
    const data = localStorage.getItem(ORDERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveOrders = (orders: IOrder[]) => {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

const generateOrderId = () => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD${dateStr}${randomStr}`;
};

const CashierPage: React.FC = () => {
  const [products] = useState<IProduct[]>(getStoredProducts);
  const [cart, setCart] = useState<ICartItem[]>([]);
  const [codeInput, setCodeInput] = useState('');
  const [receivedAmount, setReceivedAmount] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const received = parseFloat(receivedAmount) || 0;
  const change = Math.max(0, received - totalAmount);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleAddToCart = () => {
    const code = codeInput.trim();
    if (!code) {
      toast.error('请输入商品编码');
      return;
    }

    const product = products.find((p) => p.code === code);
    if (!product) {
      toast.error(`未找到编码为 "${code}" 的商品`);
      setCodeInput('');
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.code === code);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        updated[existingIndex].subtotal =
          updated[existingIndex].quantity * updated[existingIndex].price;
        return updated;
      }
      return [
        ...prev,
        {
          ...product,
          quantity: 1,
          subtotal: product.price,
        },
      ];
    });

    toast.success(`已添加: ${product.name}`);
    setCodeInput('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddToCart();
    }
  };

  const updateQuantity = (code: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.code === code) {
            const newQuantity = Math.max(1, item.quantity + delta);
            return {
              ...item,
              quantity: newQuantity,
              subtotal: newQuantity * item.price,
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (code: string) => {
    setCart((prev) => prev.filter((item) => item.code !== code));
    toast.info('商品已从购物车移除');
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    setCart([]);
    setReceivedAmount('');
    toast.info('购物车已清空');
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('购物车为空，无法结算');
      return;
    }
    setIsCheckoutOpen(true);
  };

  const confirmCheckout = () => {
    if (received < totalAmount) {
      toast.error('实收金额不足');
      return;
    }

    const order: IOrder = {
      id: generateOrderId(),
      timestamp: Date.now(),
      items: [...cart],
      totalCount,
      totalAmount,
      receivedAmount: received,
      changeAmount: change,
    };

    const orders = getStoredOrders();
    orders.unshift(order);
    saveOrders(orders);

    setCurrentOrder(order);
    setCart([]);
    setReceivedAmount('');
    setIsCheckoutOpen(false);
    setIsSuccessOpen(true);
    toast.success('结算成功！');
  };

  const formatAmount = (amount: number) => {
    return amount.toFixed(2);
  };

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingCartIcon className="size-5 text-primary" />
                商品录入
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  ref={inputRef}
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入商品编码，按回车添加"
                  className="flex-1 text-lg h-12"
                />
                <Button onClick={handleAddToCart} className="h-12 px-6">
                  添加
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                提示：输入商品编码后按回车键或点击添加按钮
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingCartIcon className="size-5 text-primary" />
                购物车
                {totalCount > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({totalCount} 件商品)
                  </span>
                )}
              </CardTitle>
              {cart.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <RotateCcwIcon className="size-4 mr-1" />
                  清空
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingCartIcon className="size-12 mx-auto mb-3 opacity-30" />
                  <p>购物车为空</p>
                  <p className="text-sm">请录入商品编码添加商品</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>商品名称</TableHead>
                        <TableHead className="text-right">单价</TableHead>
                        <TableHead className="text-center">数量</TableHead>
                        <TableHead className="text-right">小计</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map((item) => (
                        <TableRow key={item.code}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-muted-foreground">
                                编码: {item.code} / {item.unit}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            ¥{formatAmount(item.price)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="size-7"
                                onClick={() => updateQuantity(item.code, -1)}
                              >
                                <MinusIcon className="size-3" />
                              </Button>
                              <span className="w-8 text-center font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="size-7"
                                onClick={() => updateQuantity(item.code, 1)}
                              >
                                <PlusIcon className="size-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium">
                            ¥{formatAmount(item.subtotal)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => removeFromCart(item.code)}
                            >
                              <Trash2Icon className="size-4" />
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
        </div>

        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalculatorIcon className="size-5 text-primary" />
                结算信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">商品数量</span>
                  <span className="font-medium">{totalCount} 件</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">合计金额</span>
                  <span className="text-3xl font-bold font-mono text-primary">
                    ¥{formatAmount(totalAmount)}
                  </span>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <Button
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className="w-full h-14 text-lg font-semibold"
                  size="lg"
                >
                  去结算
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">快捷操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={clearCart}
                disabled={cart.length === 0}
              >
                <RotateCcwIcon className="size-4 mr-2" />
                清空购物车
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>收银结算</DialogTitle>
            <DialogDescription>
              确认订单信息并输入实收金额
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">商品数量</span>
                <span>{totalCount} 件</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">应付金额</span>
                <span className="text-2xl font-bold font-mono text-primary">
                  ¥{formatAmount(totalAmount)}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">实收金额</label>
              <Input
                type="number"
                value={receivedAmount}
                onChange={(e) => setReceivedAmount(e.target.value)}
                placeholder="输入实收金额"
                className="text-lg h-12 font-mono"
                autoFocus
              />
            </div>
            {received > 0 && (
              <div className="flex justify-between items-center pt-2">
                <span className="text-muted-foreground">找零金额</span>
                <span
                  className={`text-2xl font-bold font-mono ${
                    change >= 0 ? 'text-success' : 'text-destructive'
                  }`}
                >
                  ¥{formatAmount(change)}
                </span>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsCheckoutOpen(false)}>
              取消
            </Button>
            <Button
              onClick={confirmCheckout}
              disabled={received < totalAmount}
              className="min-w-24"
            >
              确认收款
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-success flex items-center justify-center gap-2">
              结算成功
            </DialogTitle>
          </DialogHeader>
          {currentOrder && (
            <div className="space-y-4 py-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">订单号</div>
                <div className="text-lg font-mono font-medium">
                  {currentOrder.id}
                </div>
              </div>
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">商品数量</span>
                  <span>{currentOrder.totalCount} 件</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">实收金额</span>
                  <span className="font-mono">
                    ¥{formatAmount(currentOrder.receivedAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">找零金额</span>
                  <span className="text-xl font-bold font-mono text-success">
                    ¥{formatAmount(currentOrder.changeAmount)}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => setIsSuccessOpen(false)}
              className="w-full"
            >
              完成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default CashierPage;
