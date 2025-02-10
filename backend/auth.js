const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("../database/db_crm");
require("dotenv").config();

router.post("/login", async (req, res) => {
    const { login, senha } = req.body;

    if (!login || !senha) {
        return res.status(400).json({ message: "Login e senha são obrigatórios." });
    }

    try {
        const [rows] = await db.query(
            "SELECT iduser, perfil, senha FROM usuarios WHERE login = ? AND status = 'Ativo'",
            [login]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: "Usuário ou senha inválidos." });
        }

        const user = rows[0];

        if (user.senha !== senha) {
            return res.status(401).json({ message: "Usuário ou senha inválidos." });
        }

        const token = jwt.sign(
            { iduser: user.iduser, perfil: user.perfil },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ token, iduser: user.iduser, perfil: user.perfil });
    } catch (error) {
        console.error("Erro ao realizar login:", error);
        res.status(500).json({ message: "Erro no servidor ao realizar login." });
    }
});

module.exports = router;
