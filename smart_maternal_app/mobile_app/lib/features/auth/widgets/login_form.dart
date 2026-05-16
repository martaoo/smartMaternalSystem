import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/helpers.dart';
import '../../../core/utils/validators.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/custom_textfield.dart';
import '../services/auth_api_service.dart';
import '../../../routes/app_routes.dart';

class LoginForm extends StatefulWidget {
  const LoginForm({super.key});

  @override
  State<LoginForm> createState() => _LoginFormScreenState();
}

class _LoginFormScreenState extends State<LoginForm> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _authApiService = AuthApiService();
  
  bool _isLoading = false;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isLoading = true;
    });

    final result = await _authApiService.login(
      _emailController.text.trim(),
      _passwordController.text,
    );

    setState(() {
      _isLoading = false;
    });

    if (result['success']) {
      Helpers.showSnackBar(context, 'Login successful');
      final role = result['data']?['role']?.toString();
      final route = role == 'MOTHER' ? AppRoutes.motherDashboard : AppRoutes.dashboard;
      Navigator.pushReplacementNamed(context, route);
    } else {
      Helpers.showSnackBar(
        context,
        result['message'] ?? 'Login failed',
        isError: true,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          CustomTextfield(
            label: 'Email',
            hintText: 'Enter your email',
            prefixIcon: Icons.email_outlined,
            controller: _emailController,
            validator: Validators.validateEmail,
            keyboardType: TextInputType.emailAddress,
          ),
          const SizedBox(height: 16),
          CustomTextfield(
            label: 'Password',
            hintText: 'Enter your password',
            prefixIcon: Icons.lock_outlined,
            suffixIcon: _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
            onSuffixIconPressed: () {
              setState(() {
                _obscurePassword = !_obscurePassword;
              });
            },
            obscureText: _obscurePassword,
            controller: _passwordController,
            validator: Validators.validatePassword,
          ),
          const SizedBox(height: 24),
          CustomButton(
            text: 'Sign In',
            onPressed: _handleLogin,
            isLoading: _isLoading,
          ),
        ],
      ),
    );
  }
}
