"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
process.env.DATABASE_URL =
    'postgresql://postgres.xyodrakufzmysnihukvd:Inexiaconnect2765@aws-0-eu-west-1.pooler.supabase.com:6543/postgres';
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    await app.listen(3000);
}
bootstrap();
//# sourceMappingURL=main.js.map