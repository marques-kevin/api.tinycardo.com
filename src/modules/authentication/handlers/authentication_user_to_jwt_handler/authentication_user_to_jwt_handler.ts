import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

type dtos = {
  input: {
    email: string;
    id: string;
    created_at: Date;
  };
  output: {
    access_token: string;
    id: string;
  };
};

@Injectable()
export class AuthenticationUserToJwtHandler
  implements Handler<dtos['input'], dtos['output']>
{
  constructor(private readonly jwt_service: JwtService) {}

  async execute(params: dtos['input']): Promise<dtos['output']> {
    const response = this.jwt_service.sign(params);

    return {
      access_token: response,
      id: params.id,
    };
  }
}
