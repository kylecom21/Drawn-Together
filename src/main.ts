import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { WebsocketService } from './app/web-socket.service';
import { provideHttpClient } from '@angular/common/http';
import { environment } from './app/environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    WebsocketService,
    provideHttpClient(),
    { provide: 'ENVIRONMENT', useValue: environment },
  ],
}).catch((err) => console.error(err));
