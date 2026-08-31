<?php

namespace App\Domains\AuthAdmin\Repositories;

use App\Domains\AuthAdmin\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class UserRepository
{
    public function findByLoginIdentifier(string $identifier): ?User
    {
        return User::where('emp_id', $identifier)
            ->orWhere('email', $identifier)
            ->orWhere('name', $identifier)
            ->first();
    }

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
            'emp_id' => $data['emp_id'],
            'name' => $data['name'],
            'email' => $data['email'] ?? null,
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
