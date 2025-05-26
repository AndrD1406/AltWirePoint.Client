import { Component } from '@angular/core';
import { NgForm, FormsModule }   from '@angular/forms';
import { AccountServiceProxy, RegisterDto } from '../../app/shared/api/service-proxies';
import { InputTextModule }       from 'primeng/inputtext';
import { PasswordModule }        from 'primeng/password';
import { ButtonModule }          from 'primeng/button';
import { MessageModule }         from 'primeng/message';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LocalizePipe } from "../../app/shared/pipes/localization.pipe";

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
    LocalizePipe
],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent {
    model = {
        userName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
    };
    loading = false;
    error?: string;

    constructor(
        private api: AccountServiceProxy,
        private router: Router
    ) {}

    get mismatch(): boolean {
        return this.model.password !== this.model.confirmPassword;
    }

    onSubmit(form: NgForm) {
        if (form.invalid || this.mismatch) return;
        this.loading = true;
        this.error = undefined;
    
        const dto = new RegisterDto();
        dto.userName        = this.model.userName;
        dto.email           = this.model.email;
        dto.phoneNumber     = this.model.phoneNumber;
        dto.password        = this.model.password;
        dto.confirmPassword = this.model.confirmPassword;
    
        this.api.register(dto).subscribe({
            next: () => this.router.navigate(['/login']),
            error: err => {
                this.error = err.error?.detail || 'Registration failed';
                this.loading = false;
            }
        });
    }
}