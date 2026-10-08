import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        fileParallelism: false,
        setupFiles: ["dotenv/config"],
        env: {
            JWT_ACCESS_SECRET: "hglhvtfityfvktgvl.kjbkjbhygctresexkluhionoklmlkhbytftrdreaseyuhbnijk",
            JWT_REFRESH_SECRET: "fcutdszewxyufvhlbn;jnjbhvcyerswesyxrfvkuhblnjnhljvtfrcdedxsdxyufcvi"
        }
    },
});