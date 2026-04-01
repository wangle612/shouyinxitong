import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PlusIcon, SearchIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { Table } from '@lark-apaas/client-toolkit/antd-table';

interface IProduct {
  code: string;
  name: string;
  price: number;
  unit: string;
}

const STORAGE_KEY = '__global_cashier_products';

const defaultProducts: IProduct[] = [
  { code: '1001', name: '可口可乐 500ml', price: 3.5, unit: '瓶' },
  { code: '1002', name: '雪碧 500ml', price: 3.5, unit: '瓶' },
  { code: '1003', name: '农夫山泉 550ml', price: 2.0, unit: '瓶' },
  { code: '1004', name: '康师傅红烧牛肉面', price: 4.5, unit: '桶' },
  { code: '1005', name: '乐事薯片原味', price: 6.5, unit: '袋' },
  { code: '1006', name: '德芙巧克力', price: 8.0, unit: '条' },
  { code: '1007', name: '蒙牛纯牛奶 250ml', price: 3.0, unit: '盒' },
  { code: '1008', name: '伊利酸奶', price: 5.0, unit: '杯' },
];

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [productToDelete, setProductToDelete] = useState<IProduct | null>(null);
  const [formData, setFormData] = useState<IProduct>({
    code: '',
    name: '',
    price: 0,
    unit: '个',
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setProducts(parsed);
      } catch {
        setProducts(defaultProducts);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProducts));
      }
    } else {
      setProducts(defaultProducts);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProducts));
    }
  }, []);

  const saveProducts = (newProducts: IProduct[]) => {
    setProducts(newProducts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.code.toLowerCase().includes(query) ||
        p.name.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({ code: '', name: '', price: 0, unit: '个' });
    setIsDialogOpen(true);
  };

  const handleEdit = (product: IProduct) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setIsDialogOpen(true);
  };

  const handleDelete = (product: IProduct) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!productToDelete) return;
    const newProducts = products.filter((p) => p.code !== productToDelete.code);
    saveProducts(newProducts);
    toast.success('商品已删除');
    setIsDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const handleSave = () => {
    if (!formData.code.trim()) {
      toast.error('请输入商品编码');
      return;
    }
    if (!formData.name.trim()) {
      toast.error('请输入商品名称');
      return;
    }
    if (formData.price <= 0) {
      toast.error('请输入有效的商品价格');
      return;
    }

    if (editingProduct) {
      const newProducts = products.map((p) =>
        p.code === editingProduct.code ? formData : p
      );
      saveProducts(newProducts);
      toast.success('商品已更新');
    } else {
      if (products.some((p) => p.code === formData.code)) {
        toast.error('商品编码已存在');
        return;
      }
      const newProducts = [...products, formData];
      saveProducts(newProducts);
      toast.success('商品已添加');
    }
    setIsDialogOpen(false);
  };

  const columns = [
    {
      title: '商品编码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price: number) => (
        <span className="font-mono">¥{price.toFixed(2)}</span>
      ),
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right' as const,
      render: (_: unknown, record: IProduct) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(record)}
            className="h-8 w-8"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(record)}
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section className="w-full max-w-[1400px] mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">商品管理</h1>
          <Button onClick={handleAdd} className="gap-2">
            <PlusIcon className="h-4 w-4" />
            新增商品
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索商品编码或名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <span className="text-sm text-muted-foreground">
            共 {filteredProducts.length} 件商品
          </span>
        </div>

        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table
            columns={columns}
            dataSource={filteredProducts}
            rowKey="code"
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProduct ? '编辑商品' : '新增商品'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code">
                商品编码 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="如：1001"
                disabled={!!editingProduct}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">
                商品名称 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="如：可口可乐 500ml"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">
                  单价 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">
                  单位 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  placeholder="如：个、瓶、袋"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              确定要删除商品 "{productToDelete?.name}" 吗？此操作无法撤销。
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ProductsPage;
