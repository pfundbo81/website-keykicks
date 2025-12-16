// api/create-order.js

// Import des Node.js PostgreSQL Treibers
const { Client } = require('pg'); 

// Die Hauptfunktion, die von Vercel aufgerufen wird, um die Bestellung zu verarbeiten
module.exports = async (req, res) => {
    // 1. Sicherheit: Nur POST-Anfragen akzeptieren
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    // 2. Datenprüfung: Sicherstellen, dass der Body vorhanden ist
    if (!req.body) {
        return res.status(400).send('Bad Request: Missing request body.');
    }

    // 3. Datenextraktion
    const { 
        address, 
        items, 
        shipping, 
        payment, 
        total 
    } = req.body; 
    
    // Einfache Validierung der Schlüsseldaten
    if (!address || !items || !total) {
        return res.status(400).send('Bad Request: Missing essential order data.');
    }

    // 4. Datenbank-Client initialisieren
    // Der Client verwendet automatisch process.env.DATABASE_URL
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect(); // Verbindung zur Supabase Datenbank aufbauen

        // 5. SQL-Statement: Daten in die 'orders'-Tabelle einfügen
        const queryText = `
            INSERT INTO orders (customer_email, shipping_address, order_details, total_amount, payment_method)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id;
        `;
        
        // Parameter-Array für die SQL-Abfrage
        const values = [
            address.email,
            JSON.stringify(address), // JSON-Objekte werden als Text gespeichert
            JSON.stringify(items),   
            total,
            payment
        ];

        const result = await client.query(queryText, values); // Abfrage ausführen
        
        // 6. Erfolg melden
        res.status(200).json({ 
            success: true, 
            message: 'Order successfully saved to Supabase.', 
            orderId: result.rows[0].id 
        });

    } catch (error) {
        // 7. Fehler im Falle eines Verbindungs- oder Datenbankproblems
        console.error('Database Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to save order. Check DATABASE_URL and password.',
            error: error.message
        });
    } finally {
        // 8. Verbindung immer schließen
        await client.end();
    }
};
