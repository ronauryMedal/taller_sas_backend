import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientesModule } from './clientes/clientes.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { PrismaModule } from './prisma/prisma.module';
import { TallerModule } from './taller/taller.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ServicioModule } from './servicio/servicio.module';
import { TrabajoModule } from './trabajo/trabajo.module';
import { PagosModule } from './pagos/pagos.module';
import { FacturasModule } from './facturas/facturas.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';

@Module({
  imports: [
    PrismaModule,
    TallerModule,
    UsuariosModule,
    EmpleadosModule,
    ClientesModule,
    ServicioModule,
    TrabajoModule,
    PagosModule,
    FacturasModule,
    NotificacionesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
