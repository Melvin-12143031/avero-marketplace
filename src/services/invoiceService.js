import { jsPDF } from 'jspdf'
import { formatPrice } from './orderService'

export const generateInvoice = (order) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    })

        // Invoice Header
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(24)
    doc.setTextColor(79, 70, 229)
    doc.text('MARKETPLACE', 20, 25)

    doc.setFontSize(18)
    doc.setTextColor(30, 41, 59)
    doc.text('INVOICE', 190, 25, { align: 'right' })

    // Order Information
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 116, 139)

    doc.text(`Order Reference: ${order.id}`, 20, 40)

    doc.text(
        `Invoice Date: ${new Date(order.createdAt).toLocaleDateString('en-PH', {
            dateStyle: 'medium',
        })}`,
        20,
        47,
    )

    // Header Divider
    doc.setDrawColor(226, 232, 240)
    doc.line(20, 55, 190, 55)

        // Customer Information
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(30, 41, 59)

    doc.text('BILL TO', 20, 68)
    doc.text('SHIP TO', 115, 68)

    // Bill To
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(71, 85, 105)

    doc.text(order.customer.fullName, 20, 77)
    doc.text(order.customer.email, 20, 84)
    doc.text(order.customer.phone, 20, 91)

    // Ship To
    doc.text(order.shippingAddress.address, 115, 77)

    doc.text(
        `${order.shippingAddress.city}, ${order.shippingAddress.province}`,
        115,
        84,
    )

    doc.text(order.shippingAddress.postalCode, 115, 91)

    // Customer Information Divider
    doc.setDrawColor(226, 232, 240)
    doc.line(20, 100, 190, 100)

        // Items Table Header
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(255, 255, 255)
    doc.setFillColor(79, 70, 229)

    doc.rect(20, 110, 170, 10, 'F')

    doc.text('PRODUCT', 24, 116.5)
    doc.text('QTY', 125, 116.5, { align: 'center' })
    doc.text('PRICE', 155, 116.5, { align: 'right' })
    doc.text('TOTAL', 186, 116.5, { align: 'right' })

    // Items Table Rows
    let y = 130

    order.items.forEach((item) => {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.setTextColor(71, 85, 105)

        doc.text(item.name, 24, y)
        doc.text(String(item.quantity), 125, y, { align: 'center' })
        doc.text(formatPrice(item.price), 155, y, { align: 'right' })
        doc.text(
            formatPrice(item.price * item.quantity),
            186,
            y,
            { align: 'right' },
        )

        doc.setDrawColor(226, 232, 240)
        doc.line(20, y + 5, 190, y + 5)

        y += 12
    })

        // Invoice Totals
    y += 10

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(100, 116, 139)

    doc.text('Subtotal:', 145, y, { align: 'right' })
    doc.text(formatPrice(order.subtotal), 186, y, { align: 'right' })

    y += 8

    doc.text('Shipping Fee:', 145, y, { align: 'right' })
    doc.text(formatPrice(order.shippingFee), 186, y, { align: 'right' })

    y += 10

    doc.setDrawColor(226, 232, 240)
    doc.line(125, y - 5, 190, y - 5)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(30, 41, 59)

    doc.text('TOTAL:', 145, y + 3, { align: 'right' })
    doc.text(formatPrice(order.total), 186, y + 3, { align: 'right' })

        // Invoice Footer
    y += 25

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)

    doc.text(
        'Thank you for shopping with us!',
        105,
        y,
        { align: 'center' },
    )

    doc.text(
        'This invoice was generated electronically.',
        105,
        y + 6,
        { align: 'center' },
    )

    // Open PDF in a new browser tab
    return doc.output('bloburl')
}