import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";

const CreateGroceryPlan: React.FC = () => {
  const [planName, setPlanName] = useState("");
  const [vegetable, setVegetable] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("");
  const [items, setItems] = useState<
    { vegetable: string; amount: string; frequency: string }[]
  >([]);

  const handleAddItem = () => {
    if (vegetable && amount && frequency) {
      setItems([...items, { vegetable, amount, frequency }]);
      setVegetable("");
      setAmount("");
      setFrequency("");
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSavePlan = () => {
    const plan = {
      name: planName,
      items,
    };
    console.log("Saving plan:", plan);
    // TODO: Replace with Supabase insert when backend is ready
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Grocery Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Plan Name */}
          <div>
            <Label>Plan Name</Label>
            <Input
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="Enter plan name"
            />
          </div>

          {/* Add Item Section */}
          <div className="space-y-2">
            <Label>Add Item</Label>
            <div className="flex flex-wrap gap-2">
              <select
                className="border rounded px-3 py-2"
                value={vegetable}
                onChange={(e) => setVegetable(e.target.value)}
              >
                <option value="">Select Vegetable</option>
                <option value="Potato">Potato</option>
                <option value="Tomato">Tomato</option>
                <option value="Onion">Onion</option>
                <option value="Carrot">Carrot</option>
                <option value="Cabbage">Cabbage</option>
              </select>

              <Input
                type="number"
                placeholder="Amount (kg)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <select
                className="border rounded px-3 py-2"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="">Select Frequency</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>

              <Button onClick={handleAddItem}>+ Add Item</Button>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full border mt-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">Vegetable</th>
                <th className="border px-4 py-2 text-left">Amount (kg)</th>
                <th className="border px-4 py-2 text-left">Frequency</th>
                <th className="border px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{item.vegetable}</td>
                  <td className="border px-4 py-2">{item.amount}</td>
                  <td className="border px-4 py-2">{item.frequency}</td>
                  <td className="border px-4 py-2 text-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Save + Cancel */}
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSavePlan}>Save Plan</Button>
            <Button variant="outline">Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateGroceryPlan;
