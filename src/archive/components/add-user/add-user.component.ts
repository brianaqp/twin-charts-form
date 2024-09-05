import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { UsersService } from '../../services/users.service';
import {
    AbstractControl,
    FormsModule,
    NonNullableFormBuilder,
    ReactiveFormsModule,
    ValidationErrors,
} from '@angular/forms';
import { AlertComponent } from '../alert.component';
import { Subject } from 'rxjs';
import { AlertEvent } from '../../interfaces/alert';
import { UserCreated } from '../../interfaces/users';

/**
 * Clase con validadores personalizados para el formulario de creación de usuario.
 */
class CustomValidators {
    static isUsernameValid(control: AbstractControl): ValidationErrors | null {
        const allowedChars = /^[a-zA-Z0-9]*$/;
        const isValid = allowedChars.test(control.value);
        if (!isValid) {
            return { invalidUsername: true };
        }
        return null;
    }
}

@Component({
    selector: 'app-add-token',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, AlertComponent],
    providers: [UsersService],
    templateUrl: './add-user.component.html',
    styleUrl: './add-user.component.scss',
})
export class AddUserComponent {
    private readonly userSvc = inject(UsersService);
    private readonly fb = inject(NonNullableFormBuilder);
    // --- Variables
    userCreated: UserCreated | null = null;
    // Control
    isFormSubmitted = false;
    // Form
    form = this.fb.group({
        username: this.fb.control<string>('', [CustomValidators.isUsernameValid]),
    });

    // Alert
    $alert = new Subject<AlertEvent>();

    // --- Clipboard methods
    onCopyCredentials() {
        if (this.userCreated) {
            const text = `User: ${this.userCreated.username}\nPassword: ${this.userCreated.password}`;
            navigator.clipboard
                .writeText(text)
                .then(() => {
                    this.$alert.next({
                        type: 'secondary',
                        message: 'Credentials copied to clipboard',
                    });
                })
                .catch(() => {
                    this.$alert.next({
                        type: 'danger',
                        message: 'Error copying credentials to clipboard',
                    });
                });
        }
    }

    // --- Form methods
    reset() {
        this.form.reset();
        this.isFormSubmitted = false;
    }

    onSubmit() {
        // Enable form validation in UI
        this.isFormSubmitted = true;

        // Validation
        if (this.form.invalid) {
            return;
        }

        // Get form data and create user
        const body = this.form.getRawValue();
        this.userSvc.createOne(body).subscribe({
            next: res => {
                if (res.log.insertedId) {
                    // Set user, reset and show alert status
                    this.userCreated = { username: res.data.username, password: res.data.password };
                    this.reset();
                    this.$alert.next({ type: 'success', message: 'Usuario creado con exito!' });
                } else {
                    this.$alert.next({
                        type: 'secondary',
                        message: 'No se guardo el usuario en la base de datos',
                    });
                }
            },
            error: error => {
                this.$alert.next({
                    type: 'danger',
                    message: error.error.message || 'Error. 400',
                });
            },
        });
    }
}
