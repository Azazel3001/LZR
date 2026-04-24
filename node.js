// DEVOLUCIONES
app.post('/return', async (req, res) => {
    const { saleId, reason, replaced, newModel } = req.body;
    if (!saleId || !reason) return res.status(400).json({ error: "Sale ID y motivo obligatorios" });
    const allowed = ["devolucion", "error_modelo", "garantia", "dañado"];
    if (!allowed.includes(reason)) return res.status(400).json({ error: `Motivo inválido: ${allowed.join(", ")}` });
    if ((reason === "devolucion" || reason === "error_modelo") && replaced && (!newModel || newModel.trim() === ""))
        return res.status(400).json({ error: "Debe indicar el nuevo modelo si se reemplaza" });

    const sale = await Sale.findById(saleId);
    if (!sale) return res.status(404).json({ error: "Venta no encontrada" });

    // Regresar al inventario solo devolucion y error_modelo
    if (reason === "devolucion" || reason === "error_modelo") {
        const product = await Product.findById(sale.productId);
        if (product) { product.quantity += sale.quantity; await product.save(); }
    }

    // Registrar devolución
    const ret = new Return({
        saleId: sale._id,
        productId: sale.productId,
        brand: sale.brand,
        model: sale.model,
        client: sale.client,
        reason,
        replaced: replaced || false,
        newModel: newModel || ""
    });
    await ret.save();

    // Actualizar tipo de venta
    sale.type = reason; await sale.save();

    res.json({ success: true });
});