import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { WebsocketService } from './app/web-socket.service';

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes), WebsocketService],
}).catch((err) => console.error(err));
