<?php

namespace App\Domains\AuthAdmin\Repositories;

use App\Domains\AuthAdmin\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class UserRepository
{
    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function findById(string $id): ?User
    {
        return User::with('roles.permissions')->find($id);
    }

    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return User::with('roles')->latest()->paginate($perPage);
    }

    public function create(array $data): User
    {
        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'is_active' => $data['is_active'] ?? true,
        ]);
    }

    public function update(User $user, array $data): User
    {
        $user->update($data);
        return $user->fresh();
    }

    public function delete(User $user): bool
    {
        return $user->delete();
    }
}
